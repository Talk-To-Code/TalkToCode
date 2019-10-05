package ast;

import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * this class is main in charge of construction of AST node that represents a function declaration
 * (including signature and body) of C programs
 *
 */
public class ASTFunctionC extends ASTFunction {
	private ArrayList<String> modifiers;
	private ASTExpressionUnitTypes returnType;
	private ArrayList<ASTExpressionUnitTypes> types;
	private ArrayList<ASTExpressionUnitIdentifier> parameters;
	
	public ASTFunctionC(String name) {
		super(name);
		this.returnType = new ASTExpressionUnitTypes("void");//default
		this.types = new ArrayList<ASTExpressionUnitTypes>();
		this.parameters = new ArrayList<ASTExpressionUnitIdentifier>();
		this.modifiers = new ArrayList<String>();
		
	}
	public void addModifier(String modifier){
		this.modifiers.add(modifier);
		
	}
	public void addParameter(ASTExpressionUnitTypes t,ASTExpressionUnitIdentifier p){
		this.parameters.add(p);
		p.addParent(this);
		this.types.add(t);
		t.addParent(this);
	}
	public void addReturnType(ASTExpressionUnitTypes t){
		this.returnType = t;
		t.addParent(this);
	}
	//code generation
	public String toSyntax(){
		this.result = "";
		//declaring function signature for non-main functions
		if(!this.name.equals("main")){
			for(String mod : this.modifiers){
				this.result += mod;
				this.result += " ";
			}
			this.result+=this.returnType.toSyntax();
			this.result+=" ";
			this.result+=this.name.toSyntax();
			this.result+="(";
			for(int i =0;i<this.types.size();i++){
				this.result+=this.types.get(i).toSyntax();
				if(i!=this.types.size()-1){
					this.result+=", ";
				}
			}
			this.result+=");\n";
		}
		//adding modifiers
		for(String mod : this.modifiers){
			this.result += mod;
			this.result += " ";
		}
		this.result+=this.returnType.toSyntax();
		this.result+=" ";
		this.result+=this.name.toSyntax();
		this.result+="(";
		//adding parameters
		for(int j =0;j<this.types.size();j++){
			//special case of array object
			//in C if an array is considered as a parameter e.g f(int[])
			//Signature will be type[]
			//parameter will be type parameter[]
			//this difference requires modification in syntax generation
			if(this.types.get(j).getClass()==new ASTExpressionUnitTypesArray().getClass()){
				String temp = this.types.get(j).toSyntax();
				String typeName = temp.substring(0,temp.indexOf("["));
				String dimension = temp.substring(temp.indexOf("["));
				this.result+=typeName + " ";
				this.result+=this.parameters.get(j).toSyntax();
				this.result+=dimension;
				
			} else{
				this.result+=this.types.get(j).toSyntax();
				this.result+=" ";
				this.result+=this.parameters.get(j).toSyntax();
			}
			
			if(j!=this.types.size()-1){
				this.result+=", ";
			}
		}
		this.result+="){\n";
		//Adding statements
		for(ASTStatement s:this.statements){
			this.result+="\t";
			this.result+=s.toSyntax();
			this.result+="\n";
		}
		this.result+="}\n";
		return this.result;
	}
}
