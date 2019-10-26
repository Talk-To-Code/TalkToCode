package ast;
import java.util.*;

/**
 * @author GAO RISHENG A0101891L
 * This class is in charge of AST node construction and syntax generation
 * of Struct Declaration statement in C programs
 * (Java and Python do not support struct)
 * (difference between a struct and an object is structs can only have attributes
 * and structs cannot contains function/methods as their members) 
 */
public class ASTStructDeclaration extends ASTBlockStatement {
	private static final String NODE_TYPE = "Struct define Statement";
	private ASTExpressionUnitIdentifier name;
	private ArrayList<ASTDeclarationStatementC> attributes;
	
	public ASTStructDeclaration(String name) {
		super();
		ASTExpressionUnitIdentifier structName = new ASTExpressionUnitIdentifier(name);
		this.name = structName;
		structName.addParent(this);
		this.attributes = new ArrayList<ASTDeclarationStatementC>();
	}
	public void addAttribute(ASTDeclarationStatementC a){
		this.attributes.add(a);
		a.addParent(this);
	}
	public String toSyntax(){
		this.result = "typedef struct "+this.name.toSyntax()+" {\n";
		for(ASTDeclarationStatementC s:this.attributes){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result +="\t"+s.toSyntax();
		}
		for(int i = 0; i < this.indent; i++) this.result+="\t";
		this.result+="} "+this.name.toSyntax()+";\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for(ASTStatement s:this.attributes){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
