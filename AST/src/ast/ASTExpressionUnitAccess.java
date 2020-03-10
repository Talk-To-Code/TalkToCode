package ast;

import java.util.ArrayList;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of AST nodes that represents
 * a term that an object/struct with direct access to its attributes (like object.attribute) 
 * and syntax generation of the respective term.
 * This access can be nested (e.g a.b.c etc)
 */
public class ASTExpressionUnitAccess extends ASTExpressionUnit {
	private static final String NODE_TYPE = "Expression Access";
	private ASTExpressionUnit accessParent;
	private ASTExpressionUnit child;
	public ASTExpressionUnitAccess(){
		super();
	}
	public ASTExpressionUnitAccess(ASTExpressionUnit parent,ASTExpressionUnit child){
		this();
		this.accessParent = parent;
		this.child = child;
		this.accessParent.parent = this;
		this.child.parent = this.accessParent;
	
	}
	public ASTExpressionUnitAccess(ASTExpressionUnit parent){
		this();
		this.accessParent = parent;
		
		this.accessParent.parent = this;

	
	}
	public void addChild(ASTExpressionUnit child){
		this.child = child;
		child.addParent(this.accessParent);
	}
	
	public static ASTExpressionUnitAccess generateNestedAccess(ArrayList<ASTExpressionUnit> ids){
		ASTExpressionUnit parent = ids.get(0);
		ASTExpressionUnitAccess output = new ASTExpressionUnitAccess(parent);
		ASTExpressionUnitAccess current = output;
		for(int i = 1;i<ids.size();i++){
			ASTExpressionUnit attributes = ids.get(i);
			if(i!=ids.size()-1){
				ASTExpressionUnitAccess temp = new ASTExpressionUnitAccess(attributes);
				current.addChild(temp);
				current = (ASTExpressionUnitAccess) current.child;
			} else {
				current.addChild(attributes);				
			}
			
		}
		return output;
	}
	//syntax construction
	public String toSyntax(){
		this.result = this.accessParent.toSyntax()+"."+this.child.toSyntax();
		if(this.isQuoted) quote();
		return super.toSyntax();
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
